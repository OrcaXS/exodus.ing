<script lang="ts">
  import SettingIcon from '~icons/mdi/settings-outline';
  import AddIcon from '~icons/mdi/add';
  import Markdown from '$lib/component/Markdown.svelte';
  import ArticleList from '$lib/component/ArticleList.svelte';

  const { data } = $props();
  let { user, articles, bookmarks, isMyself, tab } = $derived(data);
  const badgeClass = 'w-fit flex gap-x-1 items-center bg-accent-alt/20 hover:bg-accent-alt/30 py-1 px-2';
  const pageLink = (page: number) => `?page=${page}`;
</script>

<svelte:head>
  <title>{user.username} - EXODUS</title>
  <meta property="og:title" content={user.username} />
</svelte:head>

{#if isMyself}
  <div class="gap-x-s border-accent-alt/60 text-accent-alt flex w-fit leading-relaxed">
    <a class={badgeClass} href="/settings">
      <SettingIcon /><span>设置</span>
    </a>
    <a class={badgeClass} href="/a/new/edit">
      <AddIcon /><span>新文章</span>
    </a>
  </div>
{/if}

<article>
  <h1 class="font-serif text-4xl font-bold">
    {user.name}
  </h1>
  {#if user.aboutMe}
    <Markdown content={user.aboutMe.toString()} />
  {/if}
</article>

<div class="gap-y-xs flex flex-col">
  <div class="border-accent flex flex-row border-b">
    {#if tab === 'articles'}
      <h5 class="px-s border-accent hover:bg-accent/20 border-b-2 font-semibold">文章列表</h5>
      {#if bookmarks.items.length > 0}
        <a href="?tab=bookmarks" class="px-s hover:bg-accent/20 text-lg font-semibold">收藏列表</a>
      {/if}
    {:else}
      <a href="?tab=" class="px-s hover:bg-accent/20 text-lg font-semibold">文章列表</a>
      <h5 class="px-s border-accent hover:bg-accent/20 border-b-2 font-semibold">收藏列表</h5>
    {/if}
  </div>

  {#if tab === 'articles'}
    <ArticleList {articles} {pageLink} />
  {:else if tab === 'bookmarks' && bookmarks.items.length > 0}
    <ArticleList articles={bookmarks} {pageLink} />
  {/if}
</div>
