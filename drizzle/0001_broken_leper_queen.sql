CREATE TABLE `intranet_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`uploadedBy` int NOT NULL,
	`category` varchar(100) DEFAULT 'geral',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intranet_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intranet_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`category` varchar(100) DEFAULT 'geral',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intranet_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intranet_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`photoUrl` text NOT NULL,
	`photoKey` text NOT NULL,
	`uploadedBy` int NOT NULL,
	`album` varchar(100) DEFAULT 'geral',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intranet_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`status` enum('pendente','em_progresso','concluido') DEFAULT 'pendente',
	`description` text,
	`assignedTo` int,
	`rdStationContactId` varchar(255),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
