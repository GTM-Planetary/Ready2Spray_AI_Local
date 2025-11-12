CREATE TABLE `maps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`org_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`file_type` enum('kml','gpx','geojson') NOT NULL,
	`public_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `maps` ADD CONSTRAINT `maps_org_id_organizations_id_fk` FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;