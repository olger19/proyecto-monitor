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

	serverList, err := speedtestClient.FetchServers()
	if err != nil {
		emit("error", "server-fetch", err.Error())
		return
	}
	targets, err := serverList.FindServer([]int{})
	if err != nil || len(targets) == 0 {
		emit("error", "server-find", "No servers found")
		return
	}
	s := targets[0]

	// Bucle infinito de pruebas
	for {
		// Resetear métricas de la prueba actual
		s.DLSpeed = 0
		s.ULSpeed = 0
		s.Latency = 0
		s.Jitter = 0

		// 1. Medir Latencia (Ping) e Inestabilidad (Jitter)
		err = s.PingTest(func(latency time.Duration) {})
		if err != nil {
			emit("error", "ping", err.Error())
		} else {
			emit("progress", "ping", map[string]interface{}{
				"latency": float64(s.Latency) / float64(time.Millisecond),
				"jitter":  float64(s.Jitter) / float64(time.Millisecond),
			})
		}

		// 2. Medir Descarga (Download)
		err = s.DownloadTest()
		if err != nil {
			emit("error", "download", err.Error())
		} else {
			emit("progress", "download", s.DLSpeed.Mbps())
		}

		// 3. Medir Subida (Upload)
		err = s.UploadTest()
		if err != nil {
			emit("error", "upload", err.Error())
		} else {
			emit("progress", "upload", s.ULSpeed.Mbps())
		}

		// Indicar fin del ciclo de pruebas
		emit("done", "finished", nil)

		time.Sleep(3 * time.Second) // Pausa obligatoria entre pruebas
	}
}
