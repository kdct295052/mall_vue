<script setup lang="ts">

import {Message, HomeFilled} from "@element-plus/icons-vue";
import Index from "@/component/index.vue";
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <el-scrollbar style="border-right: darkgray 1px solid;">
    <el-menu  :default-active="'1'" :collapse="isCollapse"  style="height: 100vh ">
      <el-menu-item index="1">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>主页</span>
        </template>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>项目1</span>
        </template>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>项目2</span>
        </template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<style scoped>
 .el-menu {
  border-right: none;

}
 .el-main {
  padding: 0;
}
</style>