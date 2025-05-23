import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { services } from '$lib/server/registry';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  locals.requireLoggedInUser('load article editor');
  const data = await services.article.getArticleEditorData({
    articleId: params.articleId === 'new' ? 'new' : params.articleId,
    replyTo: url.searchParams.get('replyTo') || undefined,
  });
  return data;
};

interface FormData {
  content?: string;
  error?: string;
}

export const actions = {
  default: async ({ locals, params, request }): Promise<FormData> => {
    const data = await request.formData();
    const title = data.get('title');
    const content = data.get('content');
    const replyTo = data.get('replyTo') || undefined;
    if (typeof title !== 'string' || title.length === 0 || title === '无标题') {
      return {
        content: typeof content === 'string' ? content : undefined,
        error: '标题不能为空',
      };
    }
    if (typeof content !== 'string' || content.length === 0) {
      return {
        content: typeof content === 'string' ? content : undefined,
        error: '内容不能为空',
      };
    }
    if (typeof replyTo !== 'string' && typeof replyTo !== 'undefined') {
      return {
        content: typeof content === 'string' ? content : undefined,
        error: '必须是字符串',
      };
    }

    // New Article
    if (params.articleId === 'new') {
      const articleId = await services.article.createByMarkdown(locals, content, replyTo);
      redirect(301, `/a/${articleId}`);
    }

    // Update Article
    await services.article.updateByMarkdown(locals, params.articleId, content);
    redirect(301, `/a/${params.articleId}`);
  },
} satisfies Actions;
