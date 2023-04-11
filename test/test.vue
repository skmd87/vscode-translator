<template>
  <div>
    <div>Correct: {{ $t('group.key') }}</div>
    <div>incorrect: {{ $t('groupkey') }}, {{ $t('group-key') }},{{ $t('group.ke_y') }}</div>
    <div>Already Translated: {{ $t('group.key') }}</div>
    <div>Missing Translation: {{ $t('group.key2') }}</div>

    Tamara is the most beautiful girl is the world
  </div>
</template>

<script>
export default {
    data(){
        return{
            test: this.$t('group.key')
        }
    }
}
</script>

