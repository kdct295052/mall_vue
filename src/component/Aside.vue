<!-- src/component/Aside.vue -->
<script setup lang="ts">
import { Message, HomeFilled } from "@element-plus/icons-vue"
import router from "@/router"

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const handleMenuSelect = (index: string) => {
  switch (index) {
    case '1':
      router.push('/home/info')
      break
    case '2':
      router.push('/home/users')
      break
    case '3':
      router.push('/home/category')
      break
    case '4':
      router.push('/home/item')
      break
    case '5':
      router.push('/home/warehouse')
      break
    case '6':
      router.push('/home/suppliercustomer')
      break
    case '7':
      router.push('/home/stockin')
      break
    case '8':
      router.push('/home/stockout')
      break
  }
}
</script>

<template>
  <el-scrollbar style="border-right: darkgray 1px solid;">
    <el-menu :default-active="'1'" :collapse="isCollapse" style="height: 100vh" @select="handleMenuSelect">
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
          <span>供应商客户管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="7">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>入库管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="8">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>出库管理</span>
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
