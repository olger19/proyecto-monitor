package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/showwin/speedtest-go/speedtest"
)

// Estructura para estandarizar la salida a Vue
type ProgressEvent struct {
	Type  string      `json:"type"`
	Phase string      `json:"phase"`
	Data  interface{} `json:"data"`
}

// Función auxiliar para imprimir JSON
func emit(eventType, phase string, data interface{}) {
	event := ProgressEvent{
		Type:  eventType,
		Phase: phase,
		Data:  data,
	}
	bytes, _ := json.Marshal(event)
	fmt.Println(string(bytes))
}

func main() {
	speedtestClient := speedtest.New()
	serverList, _ := speedtestClient.FetchServers()
	targets, _ := serverList.FindServer([]int{})
	s := targets[0]

	// Bucle infinito
	for {
		s.DLSpeed = 0    // Reset
		s.DownloadTest() // Esperamos a que termine la ráfaga completa

		// Emitimos SOLO UNA VEZ por cada ciclo del for
		emit("progress", "download", s.DLSpeed.Mbps())

		time.Sleep(3 * time.Second) // Pausa obligatoria
	}
}
