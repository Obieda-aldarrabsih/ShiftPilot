package com.shiftpilot.realtime;

import com.shiftpilot.api.dto.TaskDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RealtimeBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastTaskUpdate(UUID companyId, TaskDto task) {
        messagingTemplate.convertAndSend("/topic/company/" + companyId + "/board", task);
        
        if (task.getAssignedAgentId() != null) {
            messagingTemplate.convertAndSend("/topic/agent/" + task.getAssignedAgentId(), task);
        }
    }
}
