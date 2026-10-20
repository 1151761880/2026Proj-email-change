import { Toggle } from "@/components/Toggle";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export function VideoConferencingItem({
  canAddVideo,
  videoEnabled,
  videoLabel,
  onChange,
}: {
  canAddVideo: boolean;
  videoEnabled: boolean;
  videoLabel: string | null;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>视频会议</ItemTitle>
        <ItemDescription>
          {videoLabel
            ? `为日历事件添加 ${videoLabel}。`
            : "此日历不支持视频会议链接。"}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Toggle
          name="videoConferencing"
          ariaLabel="启用或关闭视频会议"
          enabled={canAddVideo && videoEnabled}
          disabled={!canAddVideo}
          onChange={onChange}
        />
      </ItemActions>
    </Item>
  );
}
