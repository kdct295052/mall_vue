<script setup lang="ts">
import { Expand, ArrowDown, Fold } from '@element-plus/icons-vue'
import router from "@/router";
const emit = defineEmits(['collapse'])
const goToProfile = () => {
  // 这里添加跳转到个人中心的逻辑
  console.log('跳转到个人中心')
  // 示例：router.push('/profile')
}
const logout = () => {
  // 添加退出登录的逻辑
  console.log('退出登录')
  // 示例：清除token、重定向到登录页等
  router.push('/login')
}
const collapse = () => {
  emit('collapse')
}
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="toolbar">
    <div>
      <el-icon style="font-size: 20px"@click="collapse">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
    </div>
    <div style="flex: 1;text-align: center;font-size: 34px">
      <span>欢迎来到仓库管理系统</span>
    </div>
    <el-dropdown>
      <el-icon style="margin-right: 8px; margin-top: 1px"><ArrowDown /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
          <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <span>张山</span>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  line-height: 60px;
  width: 100%;

}
</style>