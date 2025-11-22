{{/*
App name.
*/}}
{{- define "ss-notifier-web.name" -}}
{{- .Chart.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ss-notifier-web.labels" -}}
helm.sh/chart: {{ include "ss-notifier-web.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "ss-notifier-web.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ss-notifier-web.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ss-notifier-web.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Web image
*/}}
{{- define "ss-notifier-web.webImage" -}}
{{- printf "%s/%s/%s:%s" .Values.imageRegistry .Values.imageRepository .Values.web.image.repository .Values.web.image.tag }}
{{- end }}

