<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <!-- 添加分类按钮 -->
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>

      <!-- 列表内容区 -->
      <tree-table
        class="treeTable"
        :data="catesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color:lightgreen"
          ></i>
          <i v-if="scope.row.cat_deleted === true" class="el-icon-error" style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level == '0'">一级</el-tag>
          <el-tag size="mini" type="success" v-if="scope.row.cat_level == '1'">二级</el-tag>
          <el-tag size="mini" type="warning" v-if="scope.row.cat_level == '2'">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- <el-table :data="catesList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column prop="cat_name" label="是否有效"></el-table-column>
        <el-table-column prop="cat_level" label="排序">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level == '0'">一级</el-tag>
            <el-tag v-if="scope.row.cat_level == '1'">二级</el-tag>
            <el-tag v-if="scope.row.cat_level == '2'">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作"></el-table-column>
      </el-table>-->

      <!-- 底部分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryCate.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryCate.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"
     @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <!-- props指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryCate: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      catesList: [],
      //   table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //   定义为模板列
          type: 'template',
          //   当前模板的名称
          template: 'isOk'
        },
        {
          label: '排序',
          //   定义为模板列
          type: 'template',
          //   当前模板的名称
          template: 'order'
        },
        {
          label: '操作',
          //   定义为模板列
          type: 'template',
          //   当前模板的名称
          template: 'opt'
        }
      ],
      //   控制添加分类的对话框
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单，验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入添加分类的名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类了id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCatesList()
  },
  methods: {
    async getCatesList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryCate
      })
      if (res.meta.status !== 200)
        return this.$message.console.error('获取商品列表失败')
      this.catesList = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize改变的事件
    handleSizeChange(newSize) {
      this.queryCate.pagesize = newSize
      // 重新请求数据，显示相应的数据
      this.getCatesList()
    },
    handleCurrentChange(newPage) {
      this.queryCate.pagenum = newPage
      this.getCatesList()
    },
    // 展示添加分类的对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })

      if (res.meta.status !== 200)
        return this.$message.console.error('获取父级列表失败')
      //   console.log(res.data)
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // 选择变化时触发该函数
    parentCateChanged() {
      console.log(this.selectedKeys);      
      if (this.selectedKeys.length > 0) {
        // 更新该分类的父级id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 更新该分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
              this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
     
      }
    },
    // 点击按钮，添加新的分类
     addCate(){
      this.$refs.addCateFormRef.validate(async valid=>{
        if(!valid) return
       const {data:res} = await this.$http.post('categories',this.addCateForm)
       if(res.meta.status !== 201) return this.$message.error('添加分类失败')

       this.$message.success('添加分类成功')
       this.getCatesList()
       this.addCateDialogVisible = false
      })
},
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
      
    },

  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>