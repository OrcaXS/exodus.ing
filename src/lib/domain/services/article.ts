import type { Article, ArticleRepository } from '$lib/domain/entities/article';
import { compileMarkdown } from '$lib/markdown';

export class ArticleService {
  constructor(private repository: ArticleRepository) {}

  async getById(articleId: string): Promise<Article> {
    return await this.repository.getById(articleId);
  }

  async createByMarkdown(userId: string, content: string, replyTo?: string): Promise<string> {
    const result = await compileMarkdown(content);
    return await this.repository.create({
      userId,
      content,
      title: result.meta.title,
      contentType: 'markdown',
      replyTo,
    });
  }

  async updateByMarkdown(articleId: string, content: string): Promise<void> {
    const result = await compileMarkdown(content);
    return await this.repository.update(articleId, {
      title: result.meta.title,
    });
  }

  async getArticle(articleId: string): Promise<Article> {
    // if articleId's length is 16, it's legacy articleId, shorten it by first 6 characters
    if (articleId.length === 16) {
      articleId = articleId.slice(0, 6);
    }
    return await this.repository.getById(articleId);
  }
}
