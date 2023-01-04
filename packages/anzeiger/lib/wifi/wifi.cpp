#include <WiFi.h>
#include "esp32-hal-log.h"
#include "freertos/task.h"

static char *TAG = (char *)"lib.wifi";

static void connect_task_handler(void *params)
{
    ESP_LOGI(TAG, "connecting to WiFi...");
    WiFi.mode(WIFI_STA);
    WiFi.begin("hello_world", "heyfolks!");

    while (WiFi.status() != WL_CONNECTED && WiFi.status() != WL_CONNECT_FAILED)
    {
        ESP_LOGD(TAG, "connecting...");
        vTaskDelay(1000);
    }

    if (WiFi.status() == WL_CONNECT_FAILED)
    {
        ESP_LOGE(TAG, "connection failed");
    }
    else
    {
        ESP_LOGI(TAG, "connected to WiFi with IP: %s", WiFi.localIP().toString());
    }

    vTaskDelete(NULL);
}

void wifi__connect(TaskHandle_t *task_handle)
{
    xTaskCreate(
        &connect_task_handler,
        "lib.wifi.connect",
        2048,
        NULL,
        tskIDLE_PRIORITY,
        task_handle);
}