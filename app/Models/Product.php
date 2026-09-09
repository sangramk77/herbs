<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;
use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property array|null $description_json
 * @property string|null $short_description
 * @property float $sell_price
 * @property float|null $mrp
 * @property int $discount_percentage
 * @property string|null $primary_image
 * @property array|null $images
 * @property array|null $videos
 * @property array|null $video_conversion_status
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property array|null $meta_keywords
 * @property int $stock
 * @property string|null $sku
 * @property array|null $tags
 * @property string $status
 * @property bool $is_featured
 * @property int|null $featured_sort_order
 * @property string|null $category_id
 * @property int $sort_order
 * @property string|null $measurement_unit_id
 * @property string|null $measurement_unit_name
 * @property string|null $measurement_unit_symbol
 * @property float|null $measurement_minimum
 * @property float|null $measurement_maximum
 * @property float|null $measurement_increment
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read string|null $primary_image_url
 * @property-read array $image_urls
 * @property-read Category|null $category
 * @property-read string|null $meta_keywords_string
 * @property-read string|null $tags_string
 * @property-read string|null $image2
 * @property-read string|null $image3
 * @property-read string|null $image4
 *
 * @method \Illuminate\Database\Eloquent\Relations\BelongsTo category()
 * @method static \Illuminate\Database\Eloquent\Builder searchable()
 * @method \Illuminate\Database\Eloquent\Builder searchable()
 */
final class Product extends Model
{
    use Searchable;
    use SoftDeletes;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * The collection associated with the model.
     *
     * @var string
     */
    protected $collection = 'products';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'description_json',
        'short_description',
        'sell_price',
        'mrp',
        'discount_percentage',
        'primary_image',
        'images',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'twitter_title',
        'twitter_description',
        'videos',
        'video_conversion_status',
        'stock',
        'sku',
        'tags',
        'status',
        'is_featured',
        'featured_sort_order',
        'category_id',
        'sort_order',
        'measurement_unit_id',
        'measurement_unit_name',
        'measurement_unit_symbol',
        'measurement_minimum',
        'measurement_maximum',
        'measurement_increment',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should have default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'active',
        'is_featured' => false,
        'stock' => 0,
        'discount_percentage' => 0,
        'sort_order' => 0,
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sort_order' => 'integer',
        'featured_sort_order' => 'integer',
    ];

    /**
     * Generate a unique slug from the product name.
     */
    public static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        // Check for uniqueness
        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }

    /**
     * Sort products for storefront display within one category.
     * Products with sort_order=0 always stay at the end.
     */
    public static function sortStorefrontCategory(Collection $products): Collection
    {
        return $products
            ->sort(function (Product $a, Product $b): int {
                $aSortOrder = (int) ($a->sort_order ?? 0);
                $bSortOrder = (int) ($b->sort_order ?? 0);

                $aIsZero = $aSortOrder === 0;
                $bIsZero = $bSortOrder === 0;

                if ($aIsZero !== $bIsZero) {
                    return $aIsZero ? 1 : -1;
                }

                if (! $aIsZero && $aSortOrder !== $bSortOrder) {
                    return $aSortOrder <=> $bSortOrder;
                }

                if (! $aIsZero) {
                    $aUpdatedAt = $a->updated_at?->getTimestamp() ?? 0;
                    $bUpdatedAt = $b->updated_at?->getTimestamp() ?? 0;
                    if ($aUpdatedAt !== $bUpdatedAt) {
                        return $aUpdatedAt <=> $bUpdatedAt;
                    }
                }

                $aCreatedAt = $a->created_at?->getTimestamp() ?? 0;
                $bCreatedAt = $b->created_at?->getTimestamp() ?? 0;
                if ($aCreatedAt !== $bCreatedAt) {
                    return $bCreatedAt <=> $aCreatedAt;
                }

                return strcmp((string) $b->_id, (string) $a->_id);
            })
            ->values();
    }

    /**
     * Sort products for storefront display while keeping items grouped by category.
     */
    public static function sortStorefrontByCategory(Collection $products): Collection
    {
        return $products
            ->groupBy(fn (Product $product) => (string) ($product->category_id ?? ''))
            ->flatMap(fn (Collection $categoryProducts) => self::sortStorefrontCategory($categoryProducts))
            ->values();
    }

    /**
     * Get the full URL for the primary image.
     */
    public function getPrimaryImageUrlAttribute(): ?string
    {
        if (! $this->primary_image) {
            return null;
        }

        return asset('uploads/products/'.$this->primary_image);
    }

    /**
     * Get full URLs for gallery images.
     */
    public function getImageUrlsAttribute(): array
    {
        if (! $this->images || ! is_array($this->images)) {
            return [];
        }

        return array_map(fn ($image) => asset('uploads/products/'.$image), $this->images);
    }

    /**
     * Scope a query to only include active products.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include in-stock products.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Get the category this product belongs to.
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope a query to use storefront product ordering within a category.
     */
    public function scopeCategorySorted($query)
    {
        return $query
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->orderBy('_id', 'desc');
    }

    /**
     * Get the index name for the model.
     */
    public function searchableAs(): string
    {
        return 'products';
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $categoryName = $this->category?->name;
        $categorySlug = $this->category?->slug;

        return [
            'id' => (string) $this->_id,
            'name' => $this->name,
            'productsName' => $this->name,
            'seoUrl' => $this->slug,
            'slug' => $this->slug,
            'image1' => $this->primary_image,
            'price' => $this->sell_price,
            'mrp' => $this->mrp,
            'discount' => $this->discount_percentage,
            'stock' => $this->stock,
            'sku' => $this->sku,
            'category_id' => $this->category_id ? (string) $this->category_id : null,
            'category_name' => $categoryName,
            'category_slug' => $categorySlug,
            'status' => $this->status,
            'created_at' => $this->created_at?->timestamp,
        ];
    }

    /**
     * Get the admin who created this product.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin who last updated this product.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if product is in stock.
     */
    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    /** @return array<int, array{value: float, label: string, price: int}> */
    public function measurementOptions(): array
    {
        if (! $this->measurement_unit_symbol || ! $this->measurement_minimum || ! $this->measurement_maximum || ! $this->measurement_increment) {
            return [];
        }

        $options = [];
        for ($value = (float) $this->measurement_minimum; $value <= (float) $this->measurement_maximum + 0.00001; $value += (float) $this->measurement_increment) {
            $roundedValue = round($value, 3);
            $options[] = ['value' => $roundedValue, 'label' => $roundedValue.' '.$this->measurement_unit_symbol, 'price' => (int) ceil(((float) $this->sell_price / (float) $this->measurement_minimum) * $roundedValue)];
        }

        return $options;
    }

    /**
     * Check if product is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug before creating
        self::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = self::generateUniqueSlug($product->name);
            }

            // Calculate discount percentage
            $mrp = $product->mrp ? (float) $product->mrp : null;
            $sellPrice = (float) $product->sell_price;
            $product->discount_percentage = self::calculateDiscount($mrp, $sellPrice);
        });

        // Recalculate discount on update
        self::updating(function ($product) {
            $mrp = $product->mrp ? (float) $product->mrp : null;
            $sellPrice = (float) $product->sell_price;
            $product->discount_percentage = self::calculateDiscount($mrp, $sellPrice);
        });
    }

    /**
     * Calculate discount percentage.
     */
    protected static function calculateDiscount(?float $mrp, float $sellPrice): int
    {
        if (! $mrp || $mrp <= 0 || $sellPrice >= $mrp) {
            return 0;
        }

        return (int) round((($mrp - $sellPrice) / $mrp) * 100);
    }

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sell_price' => 'decimal:2',
            'mrp' => 'decimal:2',
            'discount_percentage' => 'integer',
            'stock' => 'integer',
            'measurement_minimum' => 'float',
            'measurement_maximum' => 'float',
            'measurement_increment' => 'float',
            'is_featured' => 'boolean',
            'images' => 'array',
            'meta_keywords' => 'array',
            'tags' => 'array',
            'videos' => 'array',
            'video_conversion_status' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}
