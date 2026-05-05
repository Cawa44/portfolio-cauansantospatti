CREATE TABLE `interviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recruiterId` int NOT NULL,
	`candidateName` varchar(255) NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`roomName` varchar(255) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recruiters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recruiters_id` PRIMARY KEY(`id`),
	CONSTRAINT `recruiters_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `scorecards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`interviewId` int NOT NULL,
	`recruiterId` int NOT NULL,
	`communication` int NOT NULL DEFAULT 0,
	`technicalSkills` int NOT NULL DEFAULT 0,
	`culturalFit` int NOT NULL DEFAULT 0,
	`proactivity` int NOT NULL DEFAULT 0,
	`presentation` int NOT NULL DEFAULT 0,
	`strengths` text,
	`improvements` text,
	`recommendation` enum('approved','on_hold','rejected') NOT NULL DEFAULT 'on_hold',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scorecards_id` PRIMARY KEY(`id`)
);
