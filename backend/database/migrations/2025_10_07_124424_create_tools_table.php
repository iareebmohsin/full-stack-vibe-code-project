<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('documentation_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->enum('tool_type', ['library', 'framework', 'api', 'service', 'application'])->default('service');
            $table->enum('pricing_model', ['free', 'freemium', 'paid', 'open_source'])->default('free');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->integer('views_count')->default(0);
            $table->integer('favorites_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
