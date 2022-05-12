<template>
  <k-card no-body>
    <template #header>
      <div class="d-flex justify-content-between align-items-baseline">
        <div>toolkit</div>
        <div class="search-box" v-if="tools.length">
          <k-badge
            type="success"
            v-for="(word, index) in tools.keywords"
            :key="index"
            @click="words.splice(index, 1)"
            >{{ word }}
          </k-badge>
          <input
            placeholder="search"
            v-model="keyword"
          />
          <k-icon name="search"></k-icon>
        </div>
      </div>
    </template>
    <div class="tool-wrap">
      <div
        v-for="(entry, index) in tools"
        :key="index"
        v-show="showComponent(entry)"
        class="tool"
      >
        <h3 class="entry-name my-1">
          {{ entry.name || entry.component.title || entry.component.name || "unnamed" }}
        </h3>
        <div class="text-wrap-pre px-2 my-1" v-if="entry.description || entry.component.description">
          {{entry.description || entry.component.description}}
        </div>
        <div class="splitter m-1" />
        <div class="px-2 tool-component">
          <component :is="entry.component.name" />
        </div>
      </div>
    </div>
  </k-card>
</template>

<script>
import tools from "../client/register/tools";
export default {
  beforeMount() {
    tools.value.forEach((entry) => {
      this.$options.components[entry.component.name] = entry.component;
    });
  },
  data() {
    return {
      tools,
      keyword: "",
    };
  },
  methods: {
    showComponent(entry) {
      if (!this.keyword) return true
      return entry.keywords.includes(this.keyword) || entry.keywords.some(str => str.includes(this.keyword)) || entry.description?.includes(this.keyword)
    }
  },
  // magic, do not remove
  components: {},
};
</script>

<style lang="scss">
.k-card[no-body] {
  padding: 0;
  & .k-card-body {
    padding: 0;
  }
}
</style>
<style lang="scss">
$hr-color: rgba(0,0,0,0.1);
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
      content: "";
      display: block;
      @extend .my-1;
      border-top: 1px solid $hr-color
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