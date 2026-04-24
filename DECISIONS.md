## 发现的问题

- `RoomRow` 里在 `useMemo` 中调用后声明的 `const getBookingStatus`，在有 bookings 数据时会触发 TDZ `ReferenceError`。
- booking grid 有不必要的渲染成本：父组件状态变化会让整块 grid 重新 render；同时 `BookingGrid` 每次 render 都会按房间重复 `filter` 全量 bookings。
- 原来的列“虚拟化”没有形成完整方案。`useVisibleRange` 只做了按列裁切，却没有处理精确偏移对齐，复杂度高于收益。
- booking drawer 原本通过条件渲染直接挂载/卸载，遮罩和面板也分散在页面层，导致结构分散且不利于加过渡效果。
- 消息页、日期时区稳定性、以及可访问性仍有问题，但这轮没有优先处理。

## 应用的修复

- 修复了 `RoomRow` 的 TDZ 崩溃，先保证页面在有真实数据时不会直接报错。
- 把 `RoomRow` 重写成 CSS Grid 版本，并用 CSS `:hover` 替代原本依赖共享状态的 hover 视觉控制，保留现有交互和 `console.log`。
- 移除了不完整的 `useVisibleRange` 逻辑，改成直接渲染完整的 30 天表头和房态网格，并统一使用 `columnWidthPx` 作为列宽来源。
- 对 booking grid 做了局部性能优化：稳定 `onBookingClick` 回调、为 `BookingGrid` 和 `RoomRow` 加 `memo`、把 bookings 预先按房间分组，避免打开/关闭 drawer 时整块 grid 跟着重复渲染。
- 重构了 booking drawer：让 drawer 自己管理遮罩、面板和关闭动画期间的展示内容，页面层只保留 `selectedBooking` 和关闭入口。

## 权衡取舍

- 我没有引入 Redux、Zustand、React Query 等新依赖，因为当前问题主要来自状态边界和渲染策略，而不是工具能力不足。
- 我选择删除不完整的虚拟化，而不是继续补完它。在当前 30 房间 x 30 天的规模下，先回到更直接、更可验证的实现更合适。
- drawer 重构时，我最终保留了“由 `booking` 驱动开关”的耦合模式。这样页面层更简单，关闭动画期间的缓存展示逻辑则收进 drawer 内部处理。
- 我保留了现有的 `console.log`。README 已经明确提示这些日志是有意为之的，因此这轮不把日志清理混进功能和性能提交。
- 我没有在这轮继续处理消息页的状态收敛、日期工具统一或可访问性问题，因为希望每一笔提交都聚焦一个明确主题。

## 如果有更多时间

- 用 React Profiler 再验证一次当前 booking grid 的热点，确认后续是否还需要更细的 memoization 或更深层的数据预处理。
- 把 booking 的日期跨度计算继续前置，减少每个 `RoomRow` 内部的重复日期换算。
- 收敛消息页的状态来源，让 URL 和 unread count 的职责划分更清晰。
- 统一日期处理方式，避免 `toISOString().split('T')[0]` 在非 UTC 时区下带来的潜在偏移。
- 补最小化测试，优先覆盖 booking span、drawer 开关行为和消息页状态同步。
- 完善可访问性，例如更合适的交互元素、键盘导航和抽屉焦点管理。
