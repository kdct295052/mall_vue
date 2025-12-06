<template>
  <el-container class="layout-container-demo" style="height: 100%">
    <el-aside  :width="isCollapse ? '64px' : '200px'" >
    <Aside :isCollapse="isCollapse"/>
    </el-aside>

    <el-container >
      <el-header style="text-align: center; font-size: 12px;border-bottom: darkgray 1px solid;margin-top: -1px">
       <Header  :is-collapse="isCollapse" @collapse="docollaspe"/>
      </el-header>

      <el-main>
        <router-view />

      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'
import Aside from "@/component/Aside.vue";
import Header from "@/component/Header.vue";
import Main from "@/component/Main.vue";
import Item from "@/component/Item.vue";
const isCollapse = ref(false)
const docollaspe = () => {
  isCollapse.value = !isCollapse.value
}

</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  height: 100%;
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
