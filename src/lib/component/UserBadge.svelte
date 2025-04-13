<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  interface UserBadgeProps extends Pick<HTMLAnchorAttributes, 'class'> {
    name: string;
    username: string;
  }
  const { name, username, class: classProp }: UserBadgeProps = $props();
</script>

<a class={twMerge('font-medium text-accent hover:text-accent-alt', classProp)} href={`/u/${username}`}>
  {name}
</a>
