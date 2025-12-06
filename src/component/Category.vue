<!-- src/component/CategoryManagement.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页相关
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索条件
const searchForm = reactive({
  categoryName: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const categoryForm = reactive({
  categoryID: null,
  categoryName: '',
  description: ''
})

// 表单验证规则
const formRules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 100, message: '分类名称长度不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 255, message: '描述长度不能超过255个字符', trigger: 'blur' }
  ]
}

// 表单引用
const categoryFormRef = ref()

// 查询分类列表
// 查询分类列表
// 查询分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await api.post('/category/listPage', {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      params: {
        categoryName: searchForm.categoryName || null
      }
    })

    console.log('后端响应数据:', response.data)

    // 修改判断逻辑，兼容字符串和数字类型的code
    if (response.data.code == 200 || response.data.code === '200') {
      // 确保数据存在且为数组
      tableData.value = Array.isArray(response.data.data) ? response.data.data : []
      // 确保总数存在
      pagination.total = response.data.total || 0
    } else {
      ElMessage.error(response.data.msg || response.data.message || '查询失败')
    }
  } catch (error: any) {
    console.error('查询分类失败:', error)
    ElMessage.error(error.response?.data?.msg || error.response?.data?.message || '查询分类失败')
  } finally {
    loading.value = false
  }
}



// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchCategories()
}

// 重置搜索
const resetSearch = () => {
  searchForm.categoryName = ''
  pagination.currentPage = 1
  fetchCategories()
}

// 打开新增对话框
const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  // 重置表单
  Object.assign(categoryForm, {
    categoryID: null,
    categoryName: '',
    description: ''
  })
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  // 填充表单数据
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

// 删除分类
const deleteCategory = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分类 "${row.categoryName}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await api.delete(`/category/delete/${row.categoryID}`)
      if (response.data.code === "200") {
        ElMessage.success('删除成功')
        fetchCategories()
      } else {
        ElMessage.error(response.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存分类
const saveCategory = async () => {
  if (!categoryFormRef.value) return

  await categoryFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let response
        if (isEdit.value) {
          // 编辑
          response = await api.post('/category/update', categoryForm)
        } else {
          // 新增
          response = await api.post('/category/save', categoryForm)
        }

        if (response.data.code === "200") {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          dialogVisible.value = false
          fetchCategories()
        } else {
          ElMessage.error(response.data.msg || (isEdit.value ? '编辑失败' : '新增失败'))
        }
      } catch (error) {
        console.error('保存分类失败:', error)
        ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
      }
    }
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchCategories()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchCategories()
}

// 初始化
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="category-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="分类名称">
              <el-input
                v-model="searchForm.categoryName"
                placeholder="请输入分类名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="16" style="text-align: right">
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="openAddDialog" :icon="Plus">
              新增分类
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card style="margin-top: 20px">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <el-table-column prop="categoryID" label="分类ID" width="100" />
        <el-table-column prop="categoryName" label="分类名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="openEditDialog(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="deleteCategory(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; text-align: right">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑/新增对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="categoryFormRef?.resetFields()"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input
            v-model="categoryForm.categoryName"
            placeholder="请输入分类名称"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            placeholder="请输入描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
