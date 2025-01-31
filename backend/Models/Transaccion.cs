using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Transaccion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(100)]
        public string Concepto { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Monto { get; set; }

        [Required]
        public string Tipo { get; set; } = string.Empty; // Ingreso o Gasto

        [Required]
        public string Categoria { get; set; } = string.Empty;

        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [StringLength(500)]
        public string? Notas { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }
    }
}