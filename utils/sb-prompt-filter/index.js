module.exports = ({
  source,
  filter = res => res,
  rejectFilter = () => false,
  onRetry = () => undefined,
  maxRetries = 3
}) => {
  if (!source) return
  return Promise.resolve()
    .then(async () => {
      let retries = 0
      while(maxRetries--) {
        retries += 1
        const answer = await source()
        if (!answer) continue
        let filterRejectReason
        if (await rejectFilter(answer, retries)) throw answer
        if (filterRejectReason = await filter(answer, retries)) return answer
        await onRetry(answer, filterRejectReason, retries)
      }
    })
}