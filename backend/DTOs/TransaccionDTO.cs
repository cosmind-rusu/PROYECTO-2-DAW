namespace Backend.DTOs
{
    public class TransaccionDTO
    {
        public string Concepto { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string Tipo { get; set; } = string.Empty;  // Ingreso o Gasto
        public string Categoria { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string? Notas { get; set; }
    }

    public class TransaccionRespuestaDTO
    {
        public int Id { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string? Notas { get; set; }
    }
}