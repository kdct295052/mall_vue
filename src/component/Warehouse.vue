<template>
  <el-card class="warehouse-container">
    <template #header>
      <div class="card-header">
        <span>仓库信息管理</span>
      </div>
    </template>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="仓库名称">
        <el-input v-model="searchForm.name" placeholder="请输入仓库名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
          <el-option label="运营中" value="Operational" />
          <el-option label="维护中" value="Maintenance" />
          <el-option label="已关闭" value="Closed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增仓库</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="warehouseID" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="仓库名称" width="180" />
      <el-table-column prop="location" label="物理位置" show-overflow-tooltip />
      <el-table-column prop="managerID" label="负责人" width="120" align="center" />
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button :icon="Edit" type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button :icon="Delete" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        @close="warehouseFormRef?.resetFields()"
    >
      <el-form
          ref="warehouseFormRef"
          :model="warehouseForm"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="warehouseForm.name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="物理位置" prop="location">
          <el-input v-model="warehouseForm.location" type="textarea" placeholder="请输入仓库的物理位置描述" :rows="2" />
        </el-form-item>
        <el-form-item label="负责人" prop="managerID">
          <el-select v-model="warehouseForm.managerID" placeholder="请选择负责人" clearable style="width: 100%;">
            <el-option
                v-for="manager in managers"
                :key="manager.id"
                :label="manager.name"
                :value="manager.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="warehouseForm.status">
            <el-radio label="Operational">运营中</el-radio>
            <el-radio label="Maintenance">维护中</el-radio>
            <el-radio label="Closed">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api' // 假设 api 路径正确

// --- 类型定义 ---
interface Warehouse {
  warehouseID: number
  name: string
  location: string
  managerID: number | null
  managerName: string // 用于表格显示
  status: 'Operational' | 'Maintenance' | 'Closed'
}

interface Manager {
  id: number
  name: string // 假设用户表有id和name字段
}

// --- 状态数据 ---
const tableData = ref<Warehouse[]>([])
const loading = ref(false)
const warehouseFormRef = ref() // 表单引用

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索条件
const searchForm = reactive({
  name: '',
  status: null as 'Operational' | 'Maintenance' | 'Closed' | null
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const warehouseForm = reactive<Omit<Warehouse, 'managerName' | 'warehouseID' | 'managerID'> & { warehouseID: number | null, managerID: number | null }>({
  warehouseID: null,
  name: '',
  location: '',
  managerID: null,
  status: 'Operational'
})

// 负责人列表 (用于下拉框)
const managers = ref<Manager[]>([])

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { max: 100, message: '名称长度不能超过100个字符', trigger: 'blur' }
  ],
  location: [
    { max: 255, message: '位置描述不能超过255个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择仓库状态', trigger: 'change' }
  ]
}

// --- 辅助函数 ---
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'Operational': return 'success'
    case 'Maintenance': return 'warning'
    case 'Closed': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'Operational': return '运营中'
    case 'Maintenance': return '维护中'
    case 'Closed': return '已关闭'
    default: return '未知'
  }
}

// --- API 交互函数 ---

// 1. 获取负责人列表
const fetchManagers = async () => {
  try {
    // 假设后端有一个接口返回所有可能的负责人（用户）列表
    const res = await api.get('/user/user/all-managers');
    managers.value = res.data.data; // 假设返回格式为 { code: 200, data: [{ id, name }] }
  } catch (error) {
    console.error('获取负责人失败:', error);
  }
}


// 2. 获取仓库列表数据
// 2. 获取仓库列表数据
const fetchData = async () => {
  loading.value = true
  try {
    // 修改参数结构以匹配后端期望的格式
    const params = {
      pageNum: pagination.currentPage,  // 改为 pageNum
      pageSize: pagination.pageSize,
      params: {
        name: searchForm.name,
        status: searchForm.status
      }
    }

    const res = await api.post('/warehouse/listPageC', params)

    tableData.value = res.data.data || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取仓库列表失败')
  } finally {
    loading.value = false
  }
}

// 3. 处理保存 (新增或编辑)
const handleSave = () => {
  warehouseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let res;
        if (isEdit.value) {
          // 编辑操作: PUT /warehouse/update
          res = await api.post('/warehouse/update', warehouseForm);
        } else {
          // 新增操作: POST /warehouse/add
          console.log(warehouseForm);
          res = await api.post('/warehouse/add', warehouseForm);
        }

        ElMessage.success(isEdit.value ? '仓库信息更新成功' : '新增仓库成功');
        dialogVisible.value = false;
        fetchData(); // 刷新列表
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '新增失败');
      }
    }
  })
}

// 4. 处理删除
const handleDelete = (row: Warehouse) => {
  ElMessageBox.confirm(
      `确定要删除仓库 "${row.name}" 吗？该操作不可逆！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      // 假设后端接口为 DELETE /warehouse/delete/{id}
      await api.delete(`/warehouse/delete/${row.warehouseID}`)
      ElMessage.success('删除成功！')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败，请检查是否有库存或单据关联。')
    }
  }).catch(() => {
    // 用户取消删除
  })
}


// --- 事件处理函数 ---

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1 // 从第一页开始搜索
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = null
  handleSearch()
}

// 新增
const handleAdd = () => {
  // 重置表单并初始化默认值
  warehouseFormRef.value?.resetFields()
  Object.assign(warehouseForm, {
    warehouseID: null,
    name: '',
    location: '',
    managerID: null,
    status: 'Operational' // 默认状态
  })
  isEdit.value = false
  dialogTitle.value = '新增仓库信息'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Warehouse) => {
  // 等待对话框显示后，再赋值，确保表单能正确重置
  nextTick(() => {
    // 深度复制行数据到表单
    Object.assign(warehouseForm, row)
  })
  isEdit.value = true
  dialogTitle.value = '编辑仓库信息'
  dialogVisible.value = true
}

// 分页：每页条数变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchData()
}

// 分页：当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchData()
}

// 组件挂载时加载数据和负责人
onMounted(() => {
  fetchManagers()
  fetchData()
})
</script>

<style scoped>
.warehouse-container {
  margin: 20px;
}
.search-form {
  margin-bottom: 0;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>