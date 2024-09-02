#include <linux/module.h>
#define INCLUDE_VERMAGIC
#include <linux/build-salt.h>
#include <linux/elfnote-lto.h>
#include <linux/export-internal.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

BUILD_SALT;
BUILD_LTO_INFO;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__section(".gnu.linkonce.this_module") = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif


static const struct modversion_info ____versions[]
__used __section("__versions") = {
	{ 0xc1514a3b, "free_irq" },
	{ 0x532543ff, "gpiod_get_raw_value" },
	{ 0xefd6cf06, "__aeabi_unwind_cpp_pr0" },
	{ 0xb89f56a9, "tty_flip_buffer_push" },
	{ 0xa362bf8f, "hrtimer_init" },
	{ 0x74cb8fc9, "gpiod_set_raw_value" },
	{ 0xa0a28d3a, "gpiod_to_irq" },
	{ 0xe9655f7d, "tty_port_link_device" },
	{ 0xfcec0987, "enable_irq" },
	{ 0xbd394d8, "tty_termios_baud_rate" },
	{ 0xfe990052, "gpio_free" },
	{ 0x53950e70, "__tty_alloc_driver" },
	{ 0x635415a9, "tty_unregister_driver" },
	{ 0x92997ed8, "_printk" },
	{ 0x67b27ec1, "tty_std_termios" },
	{ 0x73cfa09f, "gpiod_set_debounce" },
	{ 0x2196324, "__aeabi_idiv" },
	{ 0x92d5838e, "request_threaded_irq" },
	{ 0x85f2e527, "gpiod_direction_output_raw" },
	{ 0x15ac2962, "gpiod_direction_input" },
	{ 0x828ce6bb, "mutex_lock" },
	{ 0x40aad7cd, "tty_port_init" },
	{ 0xde4bf88b, "__mutex_init" },
	{ 0x67d0d4f2, "__tty_insert_flip_char" },
	{ 0xec523f88, "hrtimer_start_range_ns" },
	{ 0x9618ede0, "mutex_unlock" },
	{ 0xcc1399ac, "tty_register_driver" },
	{ 0xb1ad28e0, "__gnu_mcount_nc" },
	{ 0xb43f9365, "ktime_get" },
	{ 0x5e9e3342, "gpio_to_desc" },
	{ 0x47229b5c, "gpio_request" },
	{ 0x695bf5e9, "hrtimer_cancel" },
	{ 0x5cc2a511, "hrtimer_forward" },
	{ 0xaa152108, "hrtimer_active" },
	{ 0xfc6bae61, "param_ops_int" },
	{ 0xf9a482f9, "msleep" },
	{ 0x8f298f30, "tty_driver_kref_put" },
	{ 0x3ce4ca6f, "disable_irq" },
	{ 0xc84d16dc, "module_layout" },
};

MODULE_INFO(depends, "");


MODULE_INFO(srcversion, "D9F6642D4AEB66C792B464E");
