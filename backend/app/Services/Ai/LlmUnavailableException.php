<?php

namespace App\Services\Ai;

use RuntimeException;

// Modello irraggiungibile, non scaricato, oltre il timeout o con risposta di errore
class LlmUnavailableException extends RuntimeException {}
