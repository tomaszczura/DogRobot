#ifndef CAMERA_STREAM_H
#define CAMERA_STREAM_H

// Enable OV5640 support
#define CONFIG_OV5640_SUPPORT 1

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// ESP-WROVER-KIT with OV5640
#define CAM_PIN_PWDN -1
#define CAM_PIN_RESET -1
#define CAM_PIN_XCLK 21
#define CAM_PIN_SIOD 26
#define CAM_PIN_SIOC 27
#define CAM_PIN_Y9 35
#define CAM_PIN_Y8 34
#define CAM_PIN_Y7 39
#define CAM_PIN_Y6 36
#define CAM_PIN_Y5 19
#define CAM_PIN_Y4 18
#define CAM_PIN_Y3 5
#define CAM_PIN_Y2 4
#define CAM_PIN_VSYNC 25
#define CAM_PIN_HREF 23
#define CAM_PIN_PCLK 22

// Try 10MHz if 20MHz doesn't work
#define CAM_XCLK_FREQ 10000000

WebServer cameraServer(80);

bool initCamera()
{
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = CAM_PIN_Y2;
  config.pin_d1 = CAM_PIN_Y3;
  config.pin_d2 = CAM_PIN_Y4;
  config.pin_d3 = CAM_PIN_Y5;
  config.pin_d4 = CAM_PIN_Y6;
  config.pin_d5 = CAM_PIN_Y7;
  config.pin_d6 = CAM_PIN_Y8;
  config.pin_d7 = CAM_PIN_Y9;
  config.pin_xclk = CAM_PIN_XCLK;
  config.pin_pclk = CAM_PIN_PCLK;
  config.pin_vsync = CAM_PIN_VSYNC;
  config.pin_href = CAM_PIN_HREF;
  config.pin_sccb_sda = CAM_PIN_SIOD;
  config.pin_sccb_scl = CAM_PIN_SIOC;
  config.pin_pwdn = CAM_PIN_PWDN;
  config.pin_reset = CAM_PIN_RESET;
  config.xclk_freq_hz = CAM_XCLK_FREQ;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_LATEST;

  // OV5640 with PSRAM can handle higher resolutions
  if (psramFound())
  {
    config.frame_size = FRAMESIZE_VGA;  // 640x480
    config.jpeg_quality = 10;
    config.fb_count = 2;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    Serial.println("PSRAM found, using VGA resolution");
  }
  else
  {
    config.frame_size = FRAMESIZE_QVGA;  // 320x240
    config.jpeg_quality = 12;
    config.fb_count = 1;
    config.fb_location = CAMERA_FB_IN_DRAM;
    Serial.println("No PSRAM, using QVGA resolution");
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK)
  {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }

  sensor_t *s = esp_camera_sensor_get();
  if (s != NULL)
  {
    Serial.printf("Camera sensor PID: 0x%x\n", s->id.PID);
    // 0x2640 = OV2640
    // 0x5640 = OV5640
    // 0x3660 = OV3660
  }

  Serial.println("Camera initialized successfully");
  return true;
}

// AP Mode configuration
#define AP_SSID "RoboDog-Cam"
#define AP_PASSWORD "robodog123"

bool startCameraAP()
{
  Serial.println("Starting WiFi Access Point...");

  WiFi.mode(WIFI_AP);
  bool success = WiFi.softAP(AP_SSID, AP_PASSWORD);

  if (success)
  {
    Serial.println("Access Point started!");
    Serial.printf("  SSID: %s\n", AP_SSID);
    Serial.printf("  Password: %s\n", AP_PASSWORD);
    Serial.print("  IP: ");
    Serial.println(WiFi.softAPIP());
    return true;
  }
  else
  {
    Serial.println("Failed to start Access Point");
    return false;
  }
}

void handleCaptureRequest()
{
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb)
  {
    cameraServer.send(500, "text/plain", "Camera capture failed");
    return;
  }

  cameraServer.sendHeader("Access-Control-Allow-Origin", "*");
  cameraServer.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  cameraServer.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

void handleStreamRequest()
{
  WiFiClient client = cameraServer.client();

  String response = "HTTP/1.1 200 OK\r\n";
  response += "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n";
  response += "Access-Control-Allow-Origin: *\r\n";
  response += "Cache-Control: no-cache\r\n";
  response += "\r\n";
  client.print(response);

  while (client.connected())
  {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb)
    {
      Serial.println("Camera capture failed during stream");
      break;
    }

    String header = "--frame\r\n";
    header += "Content-Type: image/jpeg\r\n";
    header += "Content-Length: " + String(fb->len) + "\r\n\r\n";

    client.print(header);
    client.write(fb->buf, fb->len);
    client.print("\r\n");

    esp_camera_fb_return(fb);

    if (!client.connected())
      break;

    delay(33); // ~30 FPS
  }
}

void handleStatusRequest()
{
  String json = "{\"status\":\"ok\",\"ip\":\"" + WiFi.softAPIP().toString() + "\"}";
  cameraServer.sendHeader("Access-Control-Allow-Origin", "*");
  cameraServer.send(200, "application/json", json);
}

void setupCameraServer()
{
  cameraServer.on("/capture", HTTP_GET, handleCaptureRequest);
  cameraServer.on("/stream", HTTP_GET, handleStreamRequest);
  cameraServer.on("/status", HTTP_GET, handleStatusRequest);

  cameraServer.begin();
  Serial.println("Camera HTTP server started");
  Serial.println("Endpoints:");
  Serial.println("  /capture - Single JPEG frame");
  Serial.println("  /stream  - MJPEG stream");
  Serial.println("  /status  - Server status");
}

void handleCameraServer()
{
  cameraServer.handleClient();
}

#endif
