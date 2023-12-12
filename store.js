// store.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    count: 0,
    user:{},
    dbUser:{},
    msg:{
      error:'',
      success:''
    }
  },
  mutations: {
    dbUser(state,data){
      state.dbUser = data;
    },
    setUser(state,data){
      state.user = data;
    },
    setSuccessMsg(state,data){
      state.msg.success = data;
    },
    setFailedMsg(state,data){ 
      state.msg.error = data;
    }
  },
  actions: {
    addUser(context,data){
      console.log('context',context)
      context.commit('setUser',data)
    },
    successMsg(context,data){
      context.commit('setSuccessMsg',data)
    },
    failedMsg(context,data){
      context.commit('setFailedMsg',data)
    },
  },
  getters: {
    
  },
});
