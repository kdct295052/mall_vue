<!-- src/component/ItemManagement.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

// 表格数据
const tableData = ref([])
const loading = ref(false)
// 在 script setup 中添加
interface Category {
  categoryID: number
  categoryName: string
  createTime: string
  description: string
}

// 分页相关
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索条件
const searchForm = reactive({
  itemCode: '',
  name: '',
  categoryID: null,
  isActive: null
})

// 分类选项
const categories = ref<Category[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const itemForm = reactive({
  itemID: null,
  itemCode: '',
  name: '',
  specification: '',
  categoryID: null,
  unit: '',
  safetyStock: 0,
  purchasePrice: null,
  salePrice: null,
  isActive: true
})

// 表单验证规则
const formRules = {
  itemCode: [
    { required: true, message: '请输入货品编码', trigger: 'blur' },
    { max: 50, message: '货品编码长度不能超过50个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入货品名称', trigger: 'blur' },
    { max: 255, message: '货品名称长度不能超过255个字符', trigger: 'blur' }
  ],
  categoryID: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
    { max: 20, message: '单位长度不能超过20个字符', trigger: 'blur' }
  ],
  safetyStock: [
    { required: true, message: '请输入安全库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '安全库存不能小于0', trigger: 'blur' }
  ]
}

// 表单引用
const itemFormRef = ref()

// 获取分类列表
const getCategories = async () => {
  try {
    const response = await api.get('/category/list')
    if (response.data.code === "200") {
      categories.value = response.data.data // 正确赋值给 categories
    } else {
      ElMessage.error(response.data.msg || '获取分类失败')
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    ElMessage.error('获取分类失败')
  }
}

// 查询货品列表
const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.post('/item/listPageCC', {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      params: {
        itemCode: searchForm.itemCode,
        name: searchForm.name,
        categoryID: searchForm.categoryID,
        isActive: searchForm.isActive
      }
    })

    if (response.data.code === "200") {
      tableData.value = response.data.data
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.data.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询货品失败:', error)
    ElMessage.error('查询货品失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchItems()
}

// 重置搜索
const resetSearch = () => {
  searchForm.itemCode = ''
  searchForm.name = ''
  searchForm.categoryID = null
  searchForm.isActive = null
  pagination.currentPage = 1
  fetchItems()
}
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return dateTime.replace('T', ' ')
}
// 打开新增对话框
const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增货品'
  // 重置表单
  Object.assign(itemForm, {
    itemID: null,
    itemCode: '',
    name: '',
    specification: '',
    categoryID: null,
    unit: '',
    safetyStock: 0,
    purchasePrice: null,
    salePrice: null,
    isActive: true
  })
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑货品'
  // 填充表单数据
  Object.assign(itemForm, row)
  dialogVisible.value = true
}

// 删除货品
const deleteItem = (row: any) => {
  console.log('删除的行数据:', row);
  const itemId = row.itemId || row.id;
  console.log('删除的行数据:', itemId);
  ElMessageBox.confirm(
    `确定要删除货品 "${row.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await api.delete(`/item/delete/${itemId}`)
      if (response.data.code === "200") {
        ElMessage.success('删除成功')
        fetchItems()
      } else {
        ElMessage.error(response.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除货品失败:', error)
      ElMessage.error('删除货品失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存货品
const saveItem = async () => {
  if (!itemFormRef.value) return

  await itemFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let response
        if (isEdit.value) {
          // 编辑
          response = await api.post('/item/update', itemForm)
        } else {
          // 新增
          response = await api.post('/item/save', itemForm)
        }

        if (response.data.code === "200") {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          dialogVisible.value = false
          fetchItems()
        } else {
          ElMessage.error(response.data.msg || (isEdit.value ? '编辑失败' : '新增失败'))
        }
      } catch (error) {
        console.error('保存货品失败:', error)
        ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
      }
    }
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchItems()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchItems()
}

// 初始化
onMounted(() => {
  fetchItems()
  getCategories()
})
</script>

<template>
  <div class="item-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="货品编码">
              <el-input
                v-model="searchForm.itemCode"
                placeholder="请输入货品编码"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货品名称">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入货品名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="分类">
              <el-select
                v-model="searchForm.categoryID"
                placeholder="请选择分类"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in categories"
                  :key="item.categoryID"
                  :label="item.categoryName"
                  :value="item.categoryID"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.isActive"
                placeholder="请选择状态"
                clearable
                style="width: 100%"
              >
                <el-option label="启用" :value="true" />
                <el-option label="禁用" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" style="text-align: right">
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="openAddDialog">新增货品</el-button>
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
        <el-table-column prop="itemCode" label="货品编码" min-width="120" />
        <el-table-column prop="name" label="货品名称" min-width="150" />
        <el-table-column prop="specification" label="规格" min-width="100" />
        <el-table-column prop="categoryName" label="分类" min-width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="safetyStock" label="安全库存" width="100" />
        <el-table-column prop="purchasePrice" label="采购价" width="100">
          <template #default="scope">
            ¥{{ scope.row.purchasePrice }}
          </template>
        </el-table-column>
        <el-table-column prop="salePrice" label="销售价" width="100">
          <template #default="scope">
            ¥{{ scope.row.salePrice }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
              {{ scope.row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
              @click="deleteItem(scope.row)"
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
      width="600px"
      @close="itemFormRef?.resetFields()"
    >
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货品编码" prop="itemCode">
              <el-input
                v-model="itemForm.itemCode"
                placeholder="请输入货品编码"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货品名称" prop="name">
              <el-input
                v-model="itemForm.name"
                placeholder="请输入货品名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格">
              <el-input
                v-model="itemForm.specification"
                placeholder="请输入规格"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryID">
              <el-select
                v-model="itemForm.categoryID"
                placeholder="请选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="item in categories"
                  :key="item.categoryID"
                  :label="item.categoryName"
                  :value="item.categoryID"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input
                v-model="itemForm.unit"
                placeholder="请输入单位"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全库存" prop="safetyStock">
              <el-input-number
                v-model="itemForm.safetyStock"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价">
              <el-input-number
                v-model="itemForm.purchasePrice"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售价">
              <el-input-number
                v-model="itemForm.salePrice"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch
                v-model="itemForm.isActive"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveItem">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.item-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
