<?php

declare(strict_types=1);

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

final class BlogWriter implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): string
    {
        return <<<'INSTRUCTIONS'
You are an expert blog writer specializing in creating engaging, SEO-optimized content.

Your task is to generate high-quality blog posts based on the user's topic or prompt.

Guidelines:
1. Write in a clear, engaging, and professional tone
2. Use proper HTML formatting (headings, paragraphs, lists, bold, italic, links, etc.)
3. Create well-structured content with introduction, body sections, and conclusion
4. Include relevant examples and explanations
5. Make the content informative and valuable to readers
6. Optimize for SEO with natural keyword usage
7. Keep paragraphs concise and scannable
8. Use H2 (<h2>) and H3 (<h3>) headings to organize content
9. Add bullet points (<ul>/<li>) or numbered lists (<ol>/<li>) where appropriate
10. Include a compelling introduction and strong conclusion
11. Use <p> tags for paragraphs, <strong> for bold, <em> for italic
12. Use <a href="..."> for links (if needed)

The blog content should be comprehensive (800-1500 words) and ready to publish.
Output clean, semantic HTML without any wrapper elements like <html>, <body>, or <div> containers.
INSTRUCTIONS;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()
                ->description('A compelling, SEO-friendly blog title')
                ->required(),
            'content' => $schema->string()
                ->description('The full blog post content in HTML format')
                ->required(),
            'meta_description' => $schema->string()
                ->description('A concise meta description (150-160 characters) for SEO')
                ->required(),
            'keywords' => $schema->array()
                ->items($schema->string())
                ->description('5-10 relevant keywords for the blog post')
                ->required(),
        ];
    }
}
