<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert show-icon title="注意：只允许第三级分类设置相关参数" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类</span>
          <!-- 级联选择框 -->
          <el-cascader
          :change-on-select="true"
          :clearable="true"
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>


<script>
export default {
  data() {
    return {
    //   options: [
    //     {
    //       cat_id: 'zhinan',
    //       cat_name: '指南',
    //       children: [
    //         {
    //           cat_id: 'shejiyuanze',
    //           cat_name: '设计原则'
    //         }
    //       ]
    //     },
    //     {
    //       cat_id: 'hah',
    //       cat_name: '正在',
    //       children: [
    //         {
    //           cat_id: 'shejiyuanze',
    //           cat_name: '设计思路',
    //           children: [
    //             {
    //               cat_id: 'zz',
    //               cat_name: '设计项目'
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ],
      catelist: [],
      cProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.console.error('获取商品列表失败')
      console.log(res.data)
      this.catelist = res.data
      
    },
    handleChange() {
      console.log(this.selectedCateKeys)
    }
  }
}
</script>


<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
</style>