import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName === "edit" || event.toolName === "write") {
			if (!ctx.hasUI) return undefined;

			const label = event.toolName === "edit" ? "Edit" : "Write";
			const path = (event.input as any).path;
			const confirmed = await ctx.ui.confirm(
				`Confirm ${label}`,
				`Do you want to ${label.toLowerCase()} to ${path}?`,
			);

			if (!confirmed) {
				return { block: true, reason: "Blocked by user" };
			}
		}
		return undefined;
	});
}
