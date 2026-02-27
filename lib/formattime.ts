// export function formatMessageTime(timestamp: number): string {
//   const messageDate = new Date(timestamp);
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const yesterday = new Date(today);
//   yesterday.setDate(yesterday.getDate() - 1);
  
//   const messageDay = new Date(
//     messageDate.getFullYear(),
//     messageDate.getMonth(),
//     messageDate.getDate()
//   );

//   // Today: show time only (2:34 PM)
//   if (messageDay.getTime() === today.getTime()) {
//     return messageDate.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Yesterday
//   if (messageDay.getTime() === yesterday.getTime()) {
//     return "Yesterday";
//   }

//   // This year: show date + time (Feb 15, 2:34 PM)
//   if (messageDate.getFullYear() === now.getFullYear()) {
//     return messageDate.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Different year: show full date (Feb 15, 2023, 2:34 PM)
//   return messageDate.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
// }

// export function formatConversationTime(timestamp: number): string {
//   const date = new Date(timestamp);
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const yesterday = new Date(today);
//   yesterday.setDate(yesterday.getDate() - 1);
  
//   const messageDay = new Date(
//     date.getFullYear(),
//     date.getMonth(),
//     date.getDate()
//   );

//   // Today: show time only
//   if (messageDay.getTime() === today.getTime()) {
//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Yesterday
//   if (messageDay.getTime() === yesterday.getTime()) {
//     return "Yesterday";
//   }

//   // This week: show day name
//   const daysDiff = Math.floor((today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24));
//   if (daysDiff < 7) {
//     return date.toLocaleDateString("en-US", { weekday: "short" });
//   }

//   // This year: show date
//   if (date.getFullYear() === now.getFullYear()) {
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     });
//   }

//   // Different year
//   return date.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  if (msgDay.getTime() === today.getTime()) return time;

  const diff = Math.floor((today.getTime() - msgDay.getTime()) / 86400000);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatFullMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  if (msgDay.getTime() === today.getTime()) return time;

  if (date.getFullYear() === now.getFullYear())
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;

  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${time}`;
}