#include <Arduino.h>
#include <WiFi.h>
#include "freertos/task.h"
#include "nvs_flash.h"
#include "esp32-hal-log.h"
#include "esp_sleep.h"

#include "wifi.h"
#include "led.h"
#include "screen.h"

static char *TAG = (char *)"beetle";

void init_nvs()
{
  ESP_LOGI(TAG, "initializing NVS...");
  esp_err_t ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
  {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);
}

void setup()
{
  init_nvs();

  TaskHandle_t wifi_connect_task;
  wifi__connect(&wifi_connect_task);

  led__init();
  BlinkingLED blinking_led(100);
  blinking_led.start();

  screen__init();
}

void loop() {}