ALTER TABLE `jobs` ADD `state` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `commodity_crop` varchar(200);--> statement-breakpoint
ALTER TABLE `jobs` ADD `target_pest` varchar(200);--> statement-breakpoint
ALTER TABLE `jobs` ADD `epa_number` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `application_rate` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `application_method` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `chemical_product` varchar(200);--> statement-breakpoint
ALTER TABLE `jobs` ADD `re_entry_interval` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `preharvest_interval` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `max_applications_per_season` varchar(50);--> statement-breakpoint
ALTER TABLE `jobs` ADD `max_rate_per_season` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `methods_allowed` varchar(200);--> statement-breakpoint
ALTER TABLE `jobs` ADD `rate` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `diluent_aerial` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `diluent_ground` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `diluent_chemigation` varchar(100);--> statement-breakpoint
ALTER TABLE `jobs` ADD `generic_conditions` text;