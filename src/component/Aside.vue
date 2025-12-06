<script setup lang="ts">

import {Message, HomeFilled} from "@element-plus/icons-vue";
import Index from "@/component/index.vue";
import router from "@/router";
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
});
const handleMenuSelect = (index: string) => {
  if (index === '1') {
    // 跳转到主页（使用嵌套路由）
    router.push('/home/info')
  }
  if (index === '2') {
    // 跳转到用户管理页面
    router.push('/home/users')
  }if (index === '3') {
    // 跳转到主页（使用嵌套路由）
    router.push('/home/category')
  }
  if (index === '4') {
    // 跳转到用户管理页面
    router.push('/home/item')
  }if (index === '5') {
    // 跳转到用户管理页面
    router.push('/home/warehouse')
  }
  if (index === '6') {
    // 跳转到用户管理页面
    router.push('/home/suppliercustomer')
  }
  // 可以为其他菜单项添加跳转逻辑
}
</script>

<template>
  <el-scrollbar style="border-right: darkgray 1px solid;">
    <el-menu  :default-active="'1'" :collapse="isCollapse"  style="height: 100vh "@select="handleMenuSelect">
      <el-menu-item index="1">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>主页</span>
        </template>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>用户管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>商品分类</span>
        </template>
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>商品管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="5">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>仓库管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="6">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>供应商管理</span>
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