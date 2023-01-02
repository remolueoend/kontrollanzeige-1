#include "freertos/task.h"

#ifndef LIB_LED
#define LIB_LED

void led__init();
void led__blink(TaskHandle_t *handle, uint delay_ms);

#endif