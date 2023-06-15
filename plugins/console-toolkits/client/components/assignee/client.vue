<template>
  <div class="d-block">
    <div class="d-flex align-items-baseline">
      <el-input
        id="channel"
        clearable
        v-model="searchText"
        placeholder="search assignee, channel, platform"
        style="background-color: hsl(250 10% 99%)"
      />
    </div>
    <div v-if="channelSearchResult.length">
      <template
        v-for="(result, index) in channelSearchResult"
        :key="`${result.type}-${index}`"
      >
        <el-card
          class="my-1"
          v-if="['platform', 'assignee'].includes(result.type)"
          :shadow="false"
          body-style="background-color: hsl(250 10% 99%); padding: 0;"
        >
          <template #header>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div>
                <small style="font-weight: 300">
                  {{ capitalize(result.type) }}
                </small>
                <b style="padding-left: 0.3em">
                  {{
                    capitalize(
                      result.type === 'assignee'
                        ? result.assignee
                        : result.platform
                    )
                  }}
                </b>
                <br />
                <small v-if="result.selects.length">
                  <b>{{ result.selects.length }}</b> channel(s)
                </small>
              </div>

              <el-button-group>
                <el-popover width="fit-content" trigger="click">
                  <el-form :inline="true" :model="result">
                    <el-form-item label="Assignee:" class="m-0 mr-2">
                      <el-input v-model="result.assignee" autocomplete="on" />
                    </el-form-item>
                    <el-form-item class="m-0">
                      <el-button round color="#626aef" @click="editAll(result)">
                        confirm
                      </el-button>
                    </el-form-item>
                  </el-form>
                  <template #reference>
                    <el-button round color="#626aef">change</el-button>
                  </template>
                </el-popover>
                <el-popconfirm
                  title="Are you sure to clear this?"
                  @confirm="clearAll(result)"
                >
                  <template #reference>
                    <el-button round type="danger">clear</el-button>
                  </template>
                </el-popconfirm>
              </el-button-group>
            </div>
          </template>
          <el-table
            ref="multipleTableRef"
            :data="result.selects"
            stripe
            table-layout="auto"
            :max-height="380"
          >
            <el-table-column
              v-if="result.type !== 'platform'"
              prop="platform"
              label="Platform"
            />
            <el-table-column prop="id" label="id" />
            <el-table-column prop="name" label="Name" />
            <el-table-column
              v-if="result.type !== 'assignee'"
              prop="assignee"
              label="Assignee"
            />
            <el-table-column fixed="right" label="Edit Assignee">
              <template #default="scope">
                <el-button-group>
                  <el-popover width="fit-content" trigger="click">
                    <el-form :inline="true" :model="scope.row">
                      <el-form-item label="Assignee:" class="m-0 mr-2">
                        <el-input
                          v-model="scope.row.assignee"
                          autocomplete="on"
                        />
                      </el-form-item>
                      <el-form-item class="m-0">
                        <el-button
                          round
                          color="#626aef"
                          @click="edit(scope.row)"
                        >
                          confirm
                        </el-button>
                      </el-form-item>
                    </el-form>
                    <template #reference>
                      <el-button round color="#626aef">change</el-button>
                    </template>
                  </el-popover>
                  <el-popconfirm
                    title="Are you sure to clear this?"
                    @confirm="clear(scope.row)"
                  >
                    <template #reference>
                      <el-button round type="danger">clear</el-button>
                    </template>
                  </el-popconfirm>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElCard, ElForm, ElFormItem, ElPopover, ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import axios from 'axios';

const searchText = ref('');
const channelSearchResult = ref([]);

watch(searchText, search);

async function search(val) {
  if (!val) {
    channelSearchResult.value = [];
    return;
  }
  const result = axios
    .get('/toolkit/assignee/search/' + encodeURIComponent(val))
    .then((res) => res.data)
    .then((data) => data.map((l) => ({ ...l, oldAssignee: l.assignee })));
  channelSearchResult.value = await result;
}

function edit(row) {
  const data = {
    query: {
      id: row.id,
      platform: row.platform,
    },
    assignee: row.assignee,
  };
  const res = axios
    .post('/toolkit/assignee/change', data)
    .then((res) => res.data)
    .then((data) =>
      ElMessage({
        type: 'success',
        message: data.message || data,
      })
    )
    .catch((err) =>
      ElMessage({
        type: 'error',
        message: err.message,
      })
    )
    .finally(() => search(searchText.value));
}

function clear(row) {
  const data = {
    query: {
      id: row.id,
      platform: row.platform,
    },
  };
  const res = axios
    .post('/toolkit/assignee/clear', data)
    .then((res) => res.data)
    .then((data) =>
      ElMessage({
        type: 'success',
        message: data.message || data,
      })
    )
    .catch((err) =>
      ElMessage({
        type: 'error',
        message: err.message,
      })
    )
    .finally(() => search(searchText.value));
}
function editAll(query: {
  type: 'assignee' | 'platform';
  platform?: string;
  assignee?: string;
  oldAssignee?: string;
}) {
  const data = {
    query: {
      assignee: query.oldAssignee,
      platform: query.platform,
    },
    assignee: query.assignee,
  };
  const res = axios
    .post('/toolkit/assignee/change', data)
    .then((res) => res.data)
    .then((data) =>
      ElMessage({
        type: 'success',
        message: data.message || data,
      })
    )
    .catch((err) =>
      ElMessage({
        type: 'error',
        message: err.message,
      })
    )
    .finally(() => search(searchText.value));
}
function clearAll(result: {
  type: 'assignee' | 'platform';
  platform?: string;
  assignee?: string;
  oldAssignee?: string;
}) {
  const res = axios
    .post('/toolkit/assignee/clear', {
      query: {
        assignee: result.oldAssignee,
        platform: result.platform,
      },
    })
    .then((res) => res.data)
    .then((data) =>
      ElMessage({
        type: 'success',
        message: data.message || data,
      })
    )
    .catch((err) =>
      ElMessage({
        type: 'error',
        message: err.message,
      })
    )
    .finally(() => search(searchText.value));
}
</script>
<script lang="ts">
import { defineComponent } from 'vue';
import { capitalize } from 'koishi';
export default defineComponent({
  keywords: ['assignee'],
  name: 'assignee',
  title: '修改Assignee',
  description: '支持搜索 Asignee 和 Platform.',
});
</script>

<style>
.d-block {
  display: block;
}
</style>

<style scoped src="element-plus/theme-chalk/el-button-group.css"></style>
<style scoped src="element-plus/theme-chalk/el-form-item.css"></style>
<style scoped src="element-plus/theme-chalk/el-form.css"></style>
<style scoped src="element-plus/theme-chalk/el-card.css"></style>
<style scoped src="element-plus/theme-chalk/el-popover.css"></style>
