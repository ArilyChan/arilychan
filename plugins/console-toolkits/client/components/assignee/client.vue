<template>
  <div class="d-block">
    <div class="d-flex align-items-baseline">
      <!-- <label for="channel" class="pr-1">search:</label> -->
      <!-- <k-input prefix="channel" :value="123"></k-input> -->
      <el-input id="channel" clearable v-model="search" placeholder="search assignee, channel, platform"
        class="pb-2"></el-input>
    </div>
    <div v-if="channelSearchResult.length">
      <div>result:</div>
      <template v-for="(result, index) in channelSearchResult" :key="`${result.type}-${index}`">
        <el-card class="my-1">
          <el-descriptions v-if="['platform', 'assignee'].includes(result.type)" :title="`${result.type}: ${result.type === 'assignee' ? result.assignee : result.platform
            }`" direction="vertical" border>
            <template #extra>
              <el-button-group>
                <el-button round color="#626aef" disabled>replace all</el-button>
                <el-button round type="danger" disabled>clear all</el-button>
              </el-button-group>
            </template>
            <el-descriptions-item :label="`Affects: ${result.selects.length
              ? `${result.selects.length} channels`
              : 'nothing'
              }`" class-name="p-0">
              <el-table ref="multipleTableRef" :data="result.selects" stripe table-layout="auto" :max-height="380"
                size="small">
                <el-table-column v-if="result.type !== 'platform'" prop="platform" label="Platform" />
                <el-table-column prop="id" label="id" />
                <el-table-column prop="name" label="Name" />
                <el-table-column v-if="result.type !== 'assignee'" prop="assignee" label="Assignee" />
                <el-table-column fixed="right" label="Edit Assignee">
                  <template #default="scope">
                    <el-button-group>
                      <el-popover width="fit-content" trigger="click">
                        <el-form :inline="true" :model="scope.row" @submit.prevent="editAsignee(scope.row)">
                          <el-form-item label="Assignee:" class="m-0 mr-2">
                            <el-input v-model="scope.row.assignee" autocomplete="on" />
                          </el-form-item>
                          <el-form-item class="m-0">
                            <el-button round color="#626aef" @click="editAsignee(scope.row)">confirm</el-button>
                          </el-form-item>
                        </el-form>
                        <template #reference>
                          <el-button round color="#626aef">change</el-button>
                        </template>
                      </el-popover>
                      <el-popconfirm title="Are you sure to clear this?" @confirm="clearAsignee(scope.row)">
                        <template #reference>
                          <el-button round type="danger">clear</el-button>
                        </template>
                      </el-popconfirm>
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import "element-plus/es/components/descriptions/style/css";
import "element-plus/es/components/button-group/style/css";
import "element-plus/es/components/form-item/style/css";
import "element-plus/es/components/form/style/css";
import "element-plus/es/components/card/style/css";
import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/popover/style/css";
import {
  ElDescriptions,
  ElDescriptionsItem,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElPopover,
  ElMessage
} from "element-plus";
import { defineComponent, ref, watch, unref } from "vue";
// import { store, send } from "@koishijs/client";
import axios from "axios";
// import "./base";
export default defineComponent({
  setup() {
    const search = ref("");
    const channelSearchResult = ref([]);

    watch(search, async (val) => {
      // send('toolkit/assignee/searchChannel', channel.value)
      if (!val) {
        channelSearchResult.value = []
        return
      }
      const result = axios
        .get("/toolkit/assignee/search/" + val)
        .then((res) => res.data);
      channelSearchResult.value = await result;
    });
    const edit = ref({});

    const editAsignee = (row) => {
      const data = {
        channel: {
          id: row.id,
          platform: row.platform,
        },
        assignee: row.assignee,
      };
      const res = axios
        .post("/toolkit/assignee/changeOne", {
          data,
        })
        .then((res) => res.data)
        .then(data => ElMessage({
          type: 'success',
          message: data.message || data
        }))
        .catch(err => ElMessage({
          type: 'error',
          message: err.message
        }))
    };
    const clearAsignee = (row) => {
      const data = {
        channel: {
          id: row.id,
          platform: row.platform,
        },
      };
      const res = axios
        .post("/toolkit/assignee/clearOne", {
          data,
        })
        .then((res) => res.data)
        .then(data => ElMessage({
          type: 'success',
          message: data.message || data
        }))
        .catch(err => ElMessage({
          type: 'error',
          message: err.message
        }))
    };
    return {
      search,
      channelSearchResult,
      edit,
      editAsignee,
      clearAsignee
    };
  },
  components: {
    ElDescriptions,
    ElDescriptionsItem,
    ElCard,
    ElDialog,
    ElForm,
    ElFormItem,
    ElPopover,
  },
  keywords: ["assignee"],
  name: "replace-assignee",
  title: "修改Assignee",
  description: '*暂时仅支持搜索Asignee和Platform*'
});
</script>

<style>
.d-block {
  display: block;
}
</style>
