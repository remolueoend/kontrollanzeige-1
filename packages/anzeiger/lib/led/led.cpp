#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp32-hal-log.h"
#include "driver/gpio.h"
#include "led.h"

#define LED_GPIO GPIO_NUM_2

static char *TAG = (char *)"lib.led";

typedef struct
{
    uint delay_ms;
} t_toggle_led_task_config;

static void toggle_led_taskhandler(void *__cfg)
{
    t_toggle_led_task_config *cfg = (t_toggle_led_task_config *)__cfg;

    const TickType_t xDelay = cfg->delay_ms / portTICK_PERIOD_MS;
    uint8_t led_state = 0;

    for (;;)
    {
        ESP_LOGV(TAG, "toggling LED");
        led_state = !led_state;
        gpio_set_level(LED_GPIO, led_state);
        vTaskDelay(xDelay);
    }
}

void led__blink(TaskHandle_t *handle, uint delay_ms)
{
    ESP_LOGI(TAG, "starting LED blink task");

    static t_toggle_led_task_config task_cfg;
    task_cfg.delay_ms = delay_ms;

    xTaskCreate(
        &toggle_led_taskhandler,
        "lib.led.toggle_led",
        2048,
        &task_cfg,
        tskIDLE_PRIORITY,
        handle);
}

void led__init()
{
    gpio_reset_pin(LED_GPIO);
    gpio_set_direction(LED_GPIO, GPIO_MODE_OUTPUT);
}

void BlinkingLED::start()
{
    if (this->m_handle != NULL)
        return;
    led__blink(this->m_handle, this->m_delay);
}

void BlinkingLED::stop()
{
    if (this->m_handle == NULL)
        return;
    vTaskDelete(this->m_handle);
    this->m_handle = NULL;
}
