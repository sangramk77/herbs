<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php70\Rector\StaticCall\StaticCallOnNonStaticToInstanceCallRector;
use Rector\Php81\Rector\Array_\ArrayToFirstClassCallableRector;
use Rector\TypeDeclaration\Rector\Property\TypedPropertyFromStrictConstructorRector;

return RectorConfig::configure()
    // Define paths to process (Laravel-specific directories)
    ->withPaths([
        __DIR__.'/app',
        __DIR__.'/routes',
        __DIR__.'/database',
        __DIR__.'/config', // Optional: Include config files
    ])
    // Exclude unnecessary directories
    ->withSkip([
        __DIR__.'/bootstrap',
        __DIR__.'/storage',
        __DIR__.'/vendor',
        __DIR__.'/node_modules',
        StaticCallOnNonStaticToInstanceCallRector::class,
        ArrayToFirstClassCallableRector::class,
    ])
    // Register a single rule
    ->withRules([
        TypedPropertyFromStrictConstructorRector::class,
    ])
    // Upgrade to PHP 8.3
    ->withPhpSets(php83: true)
    // Apply predefined Rector rule sets
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true
    )
    // Include root files like rector.php, ecs.php, scoper.php
    ->withRootFiles();
