<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $email
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class NewsletterSubscriber extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'newsletter_subscribers';

    protected $fillable = [
        'email',
    ];
}
