#ifndef LIB_LED
#define LIB_LED

#include "freertos/task.h"

void led__init();
void led__blink(TaskHandle_t *handle, uint delay_ms);

class BlinkingLED
{
private:
    const uint m_delay;
    TaskHandle_t *m_handle;

public:
    BlinkingLED(uint delay) : m_delay(delay), m_handle(NULL) {}
    void start();
    void stop();
};

#endif