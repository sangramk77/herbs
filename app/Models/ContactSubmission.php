<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $first_name
 * @property string $last_name
 * @property string $email
 * @property string|null $phone
 * @property string $message
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class ContactSubmission extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'contact_submissions';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'message',
    ];
}
