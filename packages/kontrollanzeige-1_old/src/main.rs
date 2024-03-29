//! # Hardware Check
//!
//! This `libstd` program is for the ESP32-C3-DevKitC-02 board.

// Logging macros

use kontrollanzeige_1::led;
use kontrollanzeige_1::led::RGB8;
use kontrollanzeige_1::wifi;
use log::*;

// If using the `binstart` feature of `esp-idf-sys`, always keep this module imported
use esp_idf_sys as _;

/// This configuration is picked up at compile time by `build.rs` from the
/// file `cfg.toml`.
#[toml_cfg::toml_config]
pub struct Config {
    #[default("")]
    wifi_ssid: &'static str,
    #[default("")]
    wifi_psk: &'static str,
}

/// Entry point to our application.
///
/// It sets up a Wi-Fi connection to the Access Point given in the
/// configuration, then blinks the RGB LED green/blue.
///
/// If the LED goes solid red, then it was unable to connect to your Wi-Fi
/// network.
fn main() -> anyhow::Result<()> {
    esp_idf_sys::link_patches();
    esp_idf_svc::log::EspLogger::initialize_default();

    info!("Hello, world!");

    // Start the LED off yellow
    let mut led = led::WS2812RMT::new()?;
    led.set_pixel(RGB8::new(50, 50, 0))?;

    // The constant `CONFIG` is auto-generated by `toml_config`.
    let app_config = CONFIG;

    // Connect to the Wi-Fi network
    let _wifi = match wifi::wifi(app_config.wifi_ssid, app_config.wifi_psk) {
        Ok(inner) => inner,
        Err(err) => {
            // Red!
            led.set_pixel(RGB8::new(50, 0, 0))?;
            anyhow::bail!("could not connect to Wi-Fi network: {:?}", err)
        }
    };
    
    info!("succesfully connected to WIFI");
    
    loop {}

    // loop {
    //     // Blue!
    //     led.set_pixel(RGB8::new(0, 0, 50))?;
    //     // Wait...
    //     std::thread::sleep(std::time::Duration::from_secs(1));
    //     info!("Hello, world!");

    //     // Green!
    //     led.set_pixel(RGB8::new(0, 50, 0))?;
    //     // Wait...
    //     std::thread::sleep(std::time::Duration::from_secs(1));
    // }
}
