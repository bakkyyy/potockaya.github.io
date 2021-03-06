import firebase from 'firebase/app'
import Feedback from './feedback_help'

export default {
  state: {
    feedbacks: []
  },
  mutations: {
    loadFeedbacks(state, payload) {
      state.feedbacks = payload
    },
    newFeedback(state, payload) {
      state.feedbacks.push(payload)
    }
  },
  actions: {
    async loadFeedbacks({
      commit
    }, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const feedback = await firebase.database().ref('feedbacks').once('value')
        const feedbacks = feedback.val()
        const feedbacksArray = []
        Object.keys(feedbacks).forEach(key => {
          const f = feedbacks[key]
          feedbacksArray.push(
            new Feedback(
              f.feedbackname,
              f.text,
              f.mack,
              f.completed,
              f.editing,
              f.data,
              f.user,
              key
            )
          )
        })
        commit('loadFeedbacks', feedbacksArray)

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async newFeedback({
      commit,
      getters
    }, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const newFeedback = new Feedback(
          payload.feedbackname,
          payload.feedbackText,
          payload.mack,
          payload.completed,
          payload.editing,
          payload.data,
          getters.user.id
        )
        const feedback = await firebase.database().ref('feedbacks').push(newFeedback)
        commit('newFeedback', {
          ...newFeedback,
          id: feedback.key
        })
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    feedbacks(state) {
      return state.feedbacks
    },
    myfeedback(state, getters) {
      return state.feedbacks.filter(feedback => {
        return feedback.user === getters.user.id
      })
    },
    feedbacksup(state) {
      return state.feedbacks.slice().sort((a, b) => b.mack - a.mack)
    },
    feedbacksdown(state) {
      return state.feedbacks.slice().sort((a, b) => a.mack - b.mack)
    },
  }
}