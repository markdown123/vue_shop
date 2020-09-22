<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加角色 -->
          <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 列表内容 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbot', i1==0 ?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二,三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRole(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRightDialog(scope.row)"
              >分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="30%">
      <p>
        角色名称：
        <el-select v-model="selectedRoleName" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.roleName"
          ></el-option>
        </el-select>
      </p>
      <p>
        角色描述：
        <el-select v-model="selectedRoleDesc" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleDesc"
            :value="item.roleDesc"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="30%">
      <p>
        角色名称：
        <el-select v-model="eSelectedRoleName" placeholder="请选择">
          <el-option
            v-for="item in uniqueRoleList"
            :key="item.id"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </p>
      <p>
        角色描述：
        <el-select v-model="eSelectedRoleDesc" placeholder="请选择">
          <el-option
            v-for="item in uniqueRoleDescList"
            :key="item.id"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="30%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 去重后的角色名称数组
      uniqueRoleList: [],
      uniqueRoleDescList: [],
      // 控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      // 分配权限的数据
      rightslist: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前即将分配权限的id
      roleId: '',
      // 添加角色选中的名称
      selectedRoleName: '',
      // 添加角色选中的角色描述
      selectedRoleDesc: '',
      // 控制添加角色对话框
      addRoleDialogVisible: false,
      // 控制编辑角色对话框
      editRoleDialogVisible: false,
      // 编辑角色选中的名称
      eSelectedRoleName: '',
      // 编辑角色选中的角色描述
      eSelectedRoleDesc: '',
      // 编辑角色的id
      editRoleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    
   
    //   获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
  
    },
   
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除权限')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success('删除权限成功')
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有分配权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      
      if (res.meta.status !== 200)
        return this.$message.error('获取分配权限树失败')
      this.rightslist = res.data
      console.log(this.rightslist)

      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    
    // 通过递归的形式，获取角色下所有三级
    // 权限的ID，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果node节点不包含children属性 ，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStr = keys.join(',')

      // 发起请求，将分配的权限存入服务器
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加角色到服务器
    async addRole() {
      // 判断是否选中了角色
      if (!(this.selectedRoleName && this.selectedRoleDesc)) {
        return this.$message.error('请输入角色名称或角色描述')
      }

      const { data: res } = await this.$http.post('roles', {
        roleName: this.selectedRoleName,
        roleDesc: this.selectedRoleDesc
      })
      if (res.meta.status !== 201) return this.$message.error('添加角色失败')
      this.getRolesList()
      this.$message.success('添加角色成功')
      this.addRoleDialogVisible = false
    },
    // 展示编辑角色框
    async showEditRole(id) {
      // console.log(id);
      const { data: res } = await this.$http.get('roles/' + id)
      
      if (res.meta.status !== 200)
        return this.$message.error('获取该角色信息失败')
        this.uniqueArr(this.rolesList)
      this.eSelectedRoleName = res.data.roleName
      this.eSelectedRoleDesc = res.data.roleDesc
      this.editRoleId = res.data.roleId
      this.editRoleDialogVisible = true
    },

    // // 数组去重
    uniqueArr(arr) {
      var arr1 = []
      var arr2 = []
      for (var i = 0; i < this.rolesList.length; i++) {
        arr1[i] = this.rolesList[i]['roleName']
        arr2[i] = this.rolesList[i]['roleDesc']
      }
      const s1 = new Set(arr1)
      const s2 = new Set(arr2)
      this.uniqueRoleList = [...s1]
      this.uniqueRoleDescList = [...s2]
    },
    
    // 将修改的角色保存到服务器
    async editRole() {
      const { data: res } = await this.$http.put('roles/' + this.editRoleId, {
        roleName: this.eSelectedRoleName,
        roleDesc: this.eSelectedRoleDesc
      })
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error('编辑角色信息失败')
      this.editRoleDialogVisible = false
      this.getRolesList()
      this.$message.success('更新角色成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbot {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>

