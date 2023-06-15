<template>
  <div class="layout-container">
    <div class="main-container">
      <div class="layout-header">
        <!-- <div class="toggle-sidebar-button" role="button" tabindex="0">
          <div class="icon"><span></span><span></span><span></span></div>
        </div> -->
        <div class="left">manage</div>
        <div class="right">
          <div class="search-box" v-if="tools.length">
            <input placeholder="search section..." v-model="keyword" />
            <small style="align-self: bottom; opacity: 0.4"
              ><k-icon name="search"></k-icon
            ></small>
          </div>
        </div>
      </div>
      <div class="tool-wrap">
        <div
          v-for="(entry, index) in tools"
          :key="index"
          v-show="showComponent(entry)"
          class="tool"
        >
          <h3 class="my-1 entry-name">
            {{ capitalize(entry.name) || entry.title || 'unnamed' }}
          </h3>
          <div class="px-2 my-1 text-wrap-pre" v-if="entry.description">
            {{ entry.description }}
          </div>
          <div class="m-1 splitter" />
          <div class="px-2 tool-component">
            <component :is="entry" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { capitalize } from 'koishi';
import { ref } from 'vue';
import assignee from './components/assignee/client.vue';

const keyword = ref('');
const tools = [assignee];
function showComponent(entry) {
  if (!keyword.value) return true;
  return (
    entry.keywords.includes(this.keyword) ||
    entry.keywords.some((str) => str.includes(this.keyword)) ||
    entry.description?.includes(this.keyword)
  );
}
</script>

<style lang="scss">
$hr-color: rgba(0, 0, 0, 0.1);
$spacer: 0.7em;
$spacing: 0 1 2 3 4;
$direction: (
  l: left,
  r: right,
  t: top,
  b: bottom,
);
$extends: (
  x: l r,
  y: t b,
);
$types: (
  m: margin,
  p: padding,
);

@each $type, $field in $types {
  @each $space in $spacing {
    .#{$type}-#{$space} {
      #{$field}: $spacer * $space !important;
    }

    @each $shorthand, $direction in $direction {
      .#{$type}#{$shorthand}-#{$space} {
        #{$field}-#{$direction}: $spacer * $space !important;
      }
    }

    @each $shorthand, $direction in $extends {
      .#{$type}#{$shorthand}-#{$space} {
        @each $i in $direction {
          @extend .#{$type}#{$i}-#{$space};
        }
      }
    }
  }
}

.text-wrap-pre {
  white-space: pre;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-baseline {
  align-items: baseline;
}

.d-flex {
  display: flex;
}

.align-items-baseline {
  align-items: baseline;
}

.entry-name {
  @extend .m-0;
  @extend .px-2;
}

.tool-wrap {
  .tool:not(:last-child) {
    &::after {
      content: '';
      display: block;
      @extend .my-1;
      border-top: 1px solid $hr-color;
    }
  }
}

.search-box {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1em;
  border: 1px solid lightgray;
  background-color: var(--card-bg);
  align-items: center;
  padding: 0 1.2rem;
  transition: var(--color-transition);

  input {
    font-size: 1em;
    background-color: transparent;
    border: none;
    outline: none;
  }

  .badge {
    flex-shrink: 0;
  }

  .badge + input {
    margin-left: 0.4rem;
  }

  .k-badge {
    cursor: pointer;
    user-select: none;
  }
}

.splitter {
  display: block;
  border: 0;
  border-top: 1px solid $hr-color;
}
</style>
