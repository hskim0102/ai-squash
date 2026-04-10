-- CreateTable
CREATE TABLE `Analysis` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `matchRecord` JSON NOT NULL,
    `praise` JSON NOT NULL,
    `improvements` JSON NOT NULL,
    `drills` JSON NOT NULL,
    `skills` JSON NOT NULL,
    `videoPath` VARCHAR(191) NULL,

    INDEX `Analysis_deviceId_createdAt_idx`(`deviceId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
