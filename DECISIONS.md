## 发现的问题

- `RoomRow` 里在 `useMemo` 中调用后声明的 `const getBookingStatus`，在有 bookings 数据时会触发 TDZ `ReferenceError`。
- booking grid 有不必要的渲染成本：父组件状态变化会让整块 grid 重新 render；同时 `BookingGrid` 每次 render 都会按房间重复 `filter` 全量 bookings。
- 原来的列“虚拟化”没有形成完整方案。`useVisibleRange` 只做了按列裁切，却没有处理精确偏移对齐，复杂度高于收益。
- booking drawer 原本通过条件渲染直接挂载/卸载，遮罩和面板也分散在页面层，导致结构分散且不利于加过渡效果。
- 消息模块把 `tickets`、`unreadCount` 和当前选中工单拆在 URL、页面 SWR 和 `MessagesContext` 三处维护，导致 sidebar 角标必须先进消息页才会同步，而且打开工单也不会真正变成已读。
- Accessibility需要优化。

## 应用的修复

- 修复了 `RoomRow` 的 TDZ 崩溃，先保证页面在有真实数据时不会直接报错。
- 把 `RoomRow` 重写成 CSS Grid 版本，并用 CSS `:hover` 替代原本依赖共享状态的 hover 视觉控制。同时，对 booking grid 做了局部性能优化：为 `BookingGrid` 和 `RoomRow` 加 `memo`、把 bookings 预先按房间分组，并把 booking 的日期偏移和跨度计算前置到 `BookingGrid`，避免打开/关闭 drawer 时整块 grid 跟着重复渲染，也减少了每个 `RoomRow` 内部的重复日期换算。
- 移除了不完整的 `useVisibleRange` 逻辑，改成直接渲染完整的 30 天表头和房态网格，并统一使用 `columnWidthPx` 作为列宽来源。
- 重构了 booking drawer：让 drawer 自己管理遮罩、面板和关闭动画期间的展示内容，页面层只保留 `selectedBooking` 和关闭入口。
- 收敛了消息页状态来源：抽出共享的 `useTickets` hook 统一管理 `tickets` 和 `unreadCount`，sidebar 与消息页共用同一份 SWR cache，并新增 `PATCH /api/tickets/[id]` 配合 optimistic update，在打开工单时立即标记已读。
- 统一了 booking 日期字符串的语义：不再用 `toISOString().split('T')[0]` 生成默认日期，也不再直接用 `new Date('YYYY-MM-DD')` 做偏移计算，改成共享的 date-only 工具按本地日历日生成、按日历日差值计算，避免非 UTC 时区下出现日期偏移。

## 权衡取舍

- 我选择删除不完整的虚拟化，而不是继续补完它。在当前 30 房间 x 30 天的规模下，我觉得没有必要过度优化，而且最终的lighthouse评分也印证了这一点。
- drawer 重构时，我最终保留了“由 `booking` 驱动开关”的耦合模式。因为我觉得这个是一个比较偏业务的组件，这样实现的话页面层更简单。之后也可以考虑抽离出更加通用的Drawer组件。
- 日期处理这次只统一了 booking 页面当前用到的 date-only 字符串链路，ticket相关的可能需要之后配合真实接口再优化。

## 如果有更多时间

- 用 React Profiler 再验证一次当前 booking grid 的热点，确认后续是否还需要更细的 memoization 或更深层的数据预处理。
- 把 booking 页面之外的时间展示也统一起来，特别是消息模块里带时区的时间字段与 date-only 字符串的边界。
- 补UT，优先覆盖 booking span、drawer 开关行为和消息页状态同步。
- 完善Accessibility，例如更合适的交互元素、键盘导航和抽屉焦点管理。
